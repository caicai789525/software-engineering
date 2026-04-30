package main

import (
	"fmt"
	"library-management-system/config"
	"library-management-system/database"
	"library-management-system/internal/controller"
	"library-management-system/pkg/response"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// main 函数
// 初始化配置、数据库、路由、启动服务器
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

	//api路由
	api := r.Group("/api")
	{
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
			readers.GET("/:reader_id", readerController.GetReader)
			readers.POST("", readerController.CreateReader)
			readers.PUT("/:reader_id", readerController.UpdateReader)
			readers.DELETE("/:reader_id", readerController.DeleteReader)
			readers.PATCH("/:reader_id/status", readerController.UpdateReaderStatus)
		}

		borrow := api.Group("/borrow")
		{
			borrow.POST("", borrowController.BorrowBook)
			borrow.POST("/return", borrowController.ReturnBook)
			borrow.GET("/reader/:reader_id", borrowController.GetReaderActiveBorrows)
		}

		statistics := api.Group("/statistics")
		{
			statistics.GET("/borrow-rank", borrowController.GetBorrowRank)
			statistics.GET("/category", borrowController.GetCategoryStats)
			statistics.GET("/overdue", borrowController.GetOverdueStats)
			statistics.GET("/monthly", borrowController.GetMonthlyStats)
		}
	}

	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
