package middleware

import (
	"bytes"
	"html"
	"io"
	"strings"

	"github.com/gin-gonic/gin"
)

func XSSFilter() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-Frame-Options", "DENY")

		for key, values := range c.Request.URL.Query() {
			for i, value := range values {
				values[i] = escapeXSS(value)
			}
			c.Request.URL.Query()[key] = values
		}

		if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
			contentType := c.GetHeader("Content-Type")
			if strings.Contains(contentType, "application/json") {
				bodyBytes, err := io.ReadAll(c.Request.Body)
				if err == nil {
					escapedBody := escapeXSS(string(bodyBytes))
					c.Request.Body = io.NopCloser(bytes.NewBufferString(escapedBody))
				}
			} else if strings.Contains(contentType, "application/x-www-form-urlencoded") {
				c.Request.ParseForm()
				for key, values := range c.Request.PostForm {
					for i, value := range values {
						values[i] = escapeXSS(value)
					}
					c.Request.PostForm[key] = values
				}
			}
		}

		c.Next()
	}
}

func escapeXSS(s string) string {
	s = html.EscapeString(s)
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	s = strings.ReplaceAll(s, "'", "&#x27;")
	s = strings.ReplaceAll(s, "/", "&#x2F;")
	s = strings.ReplaceAll(s, "`", "&#x60;")
	s = strings.ReplaceAll(s, "=", "&#x3D;")
	return s
}

func EscapeString(s string) string {
	return escapeXSS(s)
}
