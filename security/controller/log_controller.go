package controller

import (
	"library-management-system/security/service"
	"library-management-system/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LogController struct {
	logService *service.LogService
}

func NewLogController() *LogController {
	return &LogController{
		logService: service.NewLogService(),
	}
}

func (c *LogController) ListLogs(ctx *gin.Context) {
	operator := ctx.Query("operator")
	operationType := ctx.Query("operation_type")
	startTime := ctx.Query("start_time")
	endTime := ctx.Query("end_time")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))

	logs, total, err := c.logService.ListLogs(operator, operationType, startTime, endTime, page, pageSize)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, gin.H{
		"list":  logs,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func (c *LogController) ExportLogs(ctx *gin.Context) {
	operator := ctx.Query("operator")
	operationType := ctx.Query("operation_type")
	startTime := ctx.Query("start_time")
	endTime := ctx.Query("end_time")

	logs, err := c.logService.ExportLogs(operator, operationType, startTime, endTime)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, logs)
}
