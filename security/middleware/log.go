package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"library-management-system/security/service"
	"strings"

	"github.com/gin-gonic/gin"
)

type OperationType string

const (
	OpLogin         = "LOGIN"
	OpLogout        = "LOGOUT"
	OpCreateBook    = "CREATE_BOOK"
	OpUpdateBook    = "UPDATE_BOOK"
	OpDeleteBook    = "DELETE_BOOK"
	OpCreateReader  = "CREATE_READER"
	OpUpdateReader  = "UPDATE_READER"
	OpDeleteReader  = "DELETE_READER"
	OpBorrow        = "BORROW"
	OpReturn        = "RETURN"
	OpUpdateConfig  = "UPDATE_CONFIG"
)

func LogOperation(operationType OperationType) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, _ := c.Get(ContextKeyUsername)
		usernameStr, _ := username.(string)
		ip := GetClientIP(c)

		var params interface{}
		if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
			bodyBytes, _ := io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
			params = string(bodyBytes)
		} else {
			params = c.Request.URL.Query()
		}

		targetObject := ""
		if isbn := c.Param("isbn"); isbn != "" {
			targetObject = isbn
		} else if readerID := c.Param("reader_id"); readerID != "" {
			targetObject = readerID
		} else if configKey := c.Param("key"); configKey != "" {
			targetObject = configKey
		}

		logService := service.NewLogService()
		go logService.LogOperation(usernameStr, string(operationType), targetObject, params, ip)

		c.Next()
	}
}

func LogOperationForLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username"`
		}

		bodyBytes, _ := io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		json.Unmarshal(bodyBytes, &req)
		ip := GetClientIP(c)

		c.Next()

		if c.Writer.Status() == 200 {
			logService := service.NewLogService()
			go logService.LogOperation(req.Username, OpLogin, "", string(bodyBytes), ip)
		}
	}
}

func GetClientIP(c *gin.Context) string {
	ip := c.GetHeader("X-Forwarded-For")
	if ip == "" {
		ip = c.GetHeader("X-Real-IP")
	}
	if ip == "" {
		ip = c.ClientIP()
	}
	return strings.Split(ip, ",")[0]
}
