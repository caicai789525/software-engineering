
package controller

import (
	"library-management-system/internal/service"
	"library-management-system/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BorrowController struct {
	borrowService *service.BorrowService
}

func NewBorrowController() *BorrowController {
	return &BorrowController{
		borrowService: service.NewBorrowService(),
	}
}

func (c *BorrowController) BorrowBook(ctx *gin.Context) {
	var req service.BorrowRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	record, err := c.borrowService.BorrowBook(&req)
	if err != nil {
		switch err.Error() {
		case "读者不存在":
			response.Error(ctx, response.CodeReaderNotFound, err.Error())
		case "读者状态异常，无法借书":
			response.Error(ctx, response.CodeReaderDisabled, err.Error())
		case "图书不存在":
			response.Error(ctx, response.CodeBookNotFound, err.Error())
		case "图书不可借阅":
			response.Error(ctx, response.CodeBookNotAvailable, err.Error())
		case "已达到最大借阅数量":
			response.Error(ctx, response.CodeMaxBorrowReached, err.Error())
		case "该图书已被当前读者借阅且未归还":
			response.Error(ctx, response.CodeDuplicateBorrow, err.Error())
		default:
			response.Error(ctx, response.CodeError, err.Error())
		}
		return
	}

	response.Success(ctx, record)
}

func (c *BorrowController) ReturnBook(ctx *gin.Context) {
	var req service.ReturnRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	record, err := c.borrowService.ReturnBook(&req)
	if err != nil {
		if err.Error() == "未找到该图书的借阅记录" {
			response.Error(ctx, response.CodeBorrowNotFound, err.Error())
		} else {
			response.Error(ctx, response.CodeError, err.Error())
		}
		return
	}

	response.Success(ctx, record)
}

func (c *BorrowController) GetReaderActiveBorrows(ctx *gin.Context) {
	readerID := ctx.Param("reader_id")

	records, err := c.borrowService.GetReaderActiveBorrows(readerID)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, records)
}

func (c *BorrowController) GetBorrowRank(ctx *gin.Context) {
	startDate := ctx.Query("start_date")
	endDate := ctx.Query("end_date")
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	rank, err := c.borrowService.GetBorrowRank(startDate, endDate, limit)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, rank)
}

func (c *BorrowController) GetCategoryStats(ctx *gin.Context) {
	startDate := ctx.Query("start_date")
	endDate := ctx.Query("end_date")

	stats, err := c.borrowService.GetCategoryStats(startDate, endDate)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, stats)
}

func (c *BorrowController) GetOverdueStats(ctx *gin.Context) {
	startDate := ctx.Query("start_date")
	endDate := ctx.Query("end_date")

	stats, err := c.borrowService.GetOverdueStats(startDate, endDate)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, stats)
}

func (c *BorrowController) GetMonthlyStats(ctx *gin.Context) {
	year, _ := strconv.Atoi(ctx.Query("year"))

	stats, err := c.borrowService.GetMonthlyStats(year)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, stats)
}
