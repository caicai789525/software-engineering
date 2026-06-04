package main

import (
	"fmt"
	"library-management-system/config"
	"library-management-system/database"
	"library-management-system/internal/controller"
	"library-management-system/pkg/response"
	authCtrl "library-management-system/security/controller"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

const readerIDParam = "/:reader_id"

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

	bookController := controller.NewBookController()
	readerController := controller.NewReaderController()
	borrowController := controller.NewBorrowController()
	configController := controller.NewConfigController()
	authController := authCtrl.NewAuthController()
	configController.InitializeConfigs()

	api := r.Group("/api")
	{
		api.POST("/auth/login", authController.Login)

		books := api.Group("/books")
		{
			books.GET("", bookController.ListBooks)
			books.GET("/:book_id", bookController.GetBook)
			books.POST("", bookController.CreateBook)
			books.PUT("/:book_id", bookController.UpdateBook)
			books.DELETE("/:book_id", bookController.DeleteBook)
			books.PATCH("/:book_id/status", bookController.UpdateBookStatus)
		}

		readers := api.Group("/readers")
		{
			readers.GET("", readerController.ListReaders)
			readers.GET(readerIDParam, readerController.GetReader)
			readers.POST("", readerController.CreateReader)
			readers.PUT(readerIDParam, readerController.UpdateReader)
			readers.DELETE(readerIDParam, readerController.DeleteReader)
			readers.PATCH(readerIDParam+"/status", readerController.UpdateReaderStatus)
		}

		borrow := api.Group("/borrow")
		{
			borrow.POST("", borrowController.BorrowBook)
			borrow.POST("/return", borrowController.ReturnBook)
			borrow.GET("/reader"+readerIDParam, borrowController.GetReaderActiveBorrows)
			borrow.GET("/reader"+readerIDParam+"/history", borrowController.GetReaderHistoryBorrows)
		}

		statistics := api.Group("/statistics")
		{
			statistics.GET("/borrow-rank", borrowController.GetBorrowRank)
			statistics.GET("/category", borrowController.GetCategoryStats)
			statistics.GET("/overdue", borrowController.GetOverdueStats)
			statistics.GET("/monthly", borrowController.GetMonthlyStats)
		}

		config := api.Group("/config")
		{
			config.GET("", configController.GetAllConfigs)
			config.PUT("/:key", configController.UpdateConfig)
		}
	}

	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
