package main

import (
	"fmt"
	"library-management-system/config"
	"library-management-system/database"
	internal_controller "library-management-system/internal/controller"
	"library-management-system/pkg/response"
	security_controller "library-management-system/security/controller"
	"library-management-system/security/middleware"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig("config/config.yaml"); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}

	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	gin.SetMode(config.AppConfig.Server.Mode)
	r := gin.Default()

	r.NoRoute(func(c *gin.Context) {
		response.Error(c, http.StatusNotFound, "路由不存在")
	})

	r.Use(middleware.XSSFilter())

	bookController := internal_controller.NewBookController()
	readerController := internal_controller.NewReaderController()
	borrowController := internal_controller.NewBorrowController()
	authController := security_controller.NewAuthController()
	configController := security_controller.NewConfigController()
	logController := security_controller.NewLogController()

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", middleware.LogOperationForLogin(), authController.Login)
			auth.GET("/current", middleware.AuthMiddleware(), authController.GetCurrentUser)
			auth.PATCH("/change-password", middleware.AuthMiddleware(), authController.ChangePassword)
		}

		books := api.Group("/books")
		books.Use(middleware.AuthMiddleware())
		{
			books.GET("", bookController.ListBooks)
			books.GET("/:isbn", bookController.GetBook)
			books.POST("", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpCreateBook), bookController.CreateBook)
			books.PUT("/:isbn", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpUpdateBook), bookController.UpdateBook)
			books.DELETE("/:isbn", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpDeleteBook), bookController.DeleteBook)
			books.PATCH("/:isbn/status", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpUpdateBook), bookController.UpdateBookStatus)
		}

		readers := api.Group("/readers")
		readers.Use(middleware.AuthMiddleware())
		{
			readers.GET("", middleware.RequireLibrarianOrAdmin(), readerController.ListReaders)
			readers.GET("/:reader_id", middleware.RequireLibrarianOrAdmin(), readerController.GetReader)
			readers.POST("", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpCreateReader), readerController.CreateReader)
			readers.PUT("/:reader_id", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpUpdateReader), readerController.UpdateReader)
			readers.DELETE("/:reader_id", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpDeleteReader), readerController.DeleteReader)
			readers.PATCH("/:reader_id/status", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpUpdateReader), readerController.UpdateReaderStatus)
		}

		borrow := api.Group("/borrow")
		borrow.Use(middleware.AuthMiddleware())
		{
			borrow.POST("", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpBorrow), borrowController.BorrowBook)
			borrow.POST("/return", middleware.RequireLibrarianOrAdmin(), middleware.LogOperation(middleware.OpReturn), borrowController.ReturnBook)
			borrow.GET("/reader/:reader_id", middleware.RequireLibrarianOrAdmin(), borrowController.GetReaderActiveBorrows)
		}

		statistics := api.Group("/statistics")
		statistics.Use(middleware.AuthMiddleware(), middleware.RequireLibrarianOrAdmin())
		{
			statistics.GET("/borrow-rank", borrowController.GetBorrowRank)
			statistics.GET("/category", borrowController.GetCategoryStats)
			statistics.GET("/overdue", borrowController.GetOverdueStats)
			statistics.GET("/monthly", borrowController.GetMonthlyStats)
		}

		logs := api.Group("/logs")
		logs.Use(middleware.AuthMiddleware(), middleware.RequireLibrarianOrAdmin())
		{
			logs.GET("", logController.ListLogs)
			logs.GET("/export", logController.ExportLogs)
		}

		configGroup := api.Group("/config")
		configGroup.Use(middleware.AuthMiddleware())
		{
			configGroup.GET("", configController.GetAllConfigs)
			configGroup.GET("/:key", configController.GetConfig)
			configGroup.PUT("/:key", middleware.RequireAdmin(), middleware.LogOperation(middleware.OpUpdateConfig), configController.UpdateConfig)
		}
	}

	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
