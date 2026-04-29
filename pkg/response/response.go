package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	// CodeSuccess 成功
	// CodeError 错误
	CodeSuccess = 200
	CodeError   = 400

	// CodeReaderDisabled 读者已被禁用
	CodeReaderDisabled = 4001
	// CodeBookNotAvailable 图书已被借阅
	CodeBookNotAvailable = 4002
	// CodeMaxBorrowReached 最大借阅次数已达到
	CodeMaxBorrowReached = 4003
	// CodeBookNotFound 图书不存在
	CodeBookNotFound = 4004
	// CodeReaderNotFound 读者不存在
	CodeReaderNotFound = 4005
	// CodeBorrowNotFound 借阅记录不存在
	CodeBorrowNotFound = 4006
	// CodeBookHasBorrow 图书已被借阅
	CodeBookHasBorrow = 4007
	// CodeDuplicateISBN ISBN已存在
	CodeDuplicateISBN = 4008
	// CodeInvalidParam 参数错误
	CodeInvalidParam = 4009
	// CodeDuplicateBorrow 借阅记录已存在
	CodeDuplicateBorrow = 4010
)

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code: CodeSuccess,
		Msg:  "success",
		Data: data,
	})
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(http.StatusOK, Response{
		Code: code,
		Msg:  msg,
		Data: nil,
	})
}

func ErrorWithData(c *gin.Context, code int, msg string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code: code,
		Msg:  msg,
		Data: data,
	})
}
