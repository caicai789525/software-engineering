
package controller

import (
	"library-management-system/internal/service"
	"library-management-system/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReaderController struct {
	readerService *service.ReaderService
}

func NewReaderController() *ReaderController {
	return &ReaderController{
		readerService: service.NewReaderService(),
	}
}

func (c *ReaderController) CreateReader(ctx *gin.Context) {
	var req service.CreateReaderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	reader, err := c.readerService.CreateReader(&req)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, reader)
}

func (c *ReaderController) UpdateReader(ctx *gin.Context) {
	readerID := ctx.Param("reader_id")
	var req service.UpdateReaderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	reader, err := c.readerService.UpdateReader(readerID, &req)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, reader)
}

func (c *ReaderController) DeleteReader(ctx *gin.Context) {
	readerID := ctx.Param("reader_id")

	err := c.readerService.DeleteReader(readerID)
	if err != nil {
		if err.Error() == "该读者有未归还的借阅记录" {
			response.Error(ctx, response.CodeBookHasBorrow, err.Error())
		} else {
			response.Error(ctx, response.CodeError, err.Error())
		}
		return
	}

	response.Success(ctx, nil)
}

func (c *ReaderController) GetReader(ctx *gin.Context) {
	readerID := ctx.Param("reader_id")

	reader, err := c.readerService.GetReader(readerID)
	if err != nil {
		response.Error(ctx, response.CodeReaderNotFound, "读者不存在")
		return
	}

	response.Success(ctx, reader)
}

func (c *ReaderController) ListReaders(ctx *gin.Context) {
	keyword := ctx.Query("keyword")
	status := ctx.Query("status")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))

	readers, total, err := c.readerService.ListReaders(keyword, status, page, pageSize)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, gin.H{
		"list":  readers,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func (c *ReaderController) UpdateReaderStatus(ctx *gin.Context) {
	readerID := ctx.Param("reader_id")
	var req service.UpdateReaderStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	err := c.readerService.UpdateReaderStatus(readerID, req.Status)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, nil)
}
