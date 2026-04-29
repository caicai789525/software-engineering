package controller

import (
	"library-management-system/internal/service"
	"library-management-system/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BookController struct {
	bookService *service.BookService
}

// NewBookController 创建图书控制器
func NewBookController() *BookController {
	return &BookController{
		bookService: service.NewBookService(),
	}
}

// CreateBook 创建图书
func (c *BookController) CreateBook(ctx *gin.Context) {
	var req service.CreateBookRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}
	// 创建图书
	book, err := c.bookService.CreateBook(&req)
	if err != nil {
		if err.Error() == "ISBN已存在" {
			response.Error(ctx, response.CodeDuplicateISBN, err.Error())
		} else {
			response.Error(ctx, response.CodeError, err.Error())
		}
		return
	}

	response.Success(ctx, book)
}

// UpdateBook 更新图书
func (c *BookController) UpdateBook(ctx *gin.Context) {
	isbn := ctx.Param("isbn")
	// 更新图书
	var req service.UpdateBookRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}
	// 更新图书
	book, err := c.bookService.UpdateBook(isbn, &req)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, book)
}

// DeleteBook 删除图书
func (c *BookController) DeleteBook(ctx *gin.Context) {
	isbn := ctx.Param("isbn")

	err := c.bookService.DeleteBook(isbn)
	if err != nil {
		if err.Error() == "该图书有未归还的借阅记录" {
			response.Error(ctx, response.CodeBookHasBorrow, err.Error())
		} else {
			response.Error(ctx, response.CodeError, err.Error())
		}
		return
	}

	response.Success(ctx, nil)
}

// GetBook 获取图书
func (c *BookController) GetBook(ctx *gin.Context) {
	isbn := ctx.Param("isbn")

	book, err := c.bookService.GetBook(isbn)
	if err != nil {
		response.Error(ctx, response.CodeBookNotFound, "图书不存在")
		return
	}

	response.Success(ctx, book)
}

// ListBooks 获取图书列表
func (c *BookController) ListBooks(ctx *gin.Context) {
	keyword := ctx.Query("keyword")
	category := ctx.Query("category")
	status := ctx.Query("status")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))

	books, total, err := c.bookService.ListBooks(keyword, category, status, page, pageSize)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}
	// 返回图书列表
	response.Success(ctx, gin.H{
		"list":  books,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

// UpdateBookStatus 更新图书状态
func (c *BookController) UpdateBookStatus(ctx *gin.Context) {
	isbn := ctx.Param("isbn")
	var req service.UpdateStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}
	// 更新图书状态，返回图书列表
	err := c.bookService.UpdateBookStatus(isbn, req.Status)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, nil)
}
