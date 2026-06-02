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
		setSecurityHeaders(c)
		filterQueryParams(c)
		filterRequestBody(c)
		c.Next()
	}
}

func setSecurityHeaders(c *gin.Context) {
	c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")
	c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
	c.Writer.Header().Set("X-Frame-Options", "DENY")
}

func filterQueryParams(c *gin.Context) {
	for key, values := range c.Request.URL.Query() {
		c.Request.URL.Query()[key] = escapeStringSlice(values)
	}
}

func filterRequestBody(c *gin.Context) {
	if !isWriteMethod(c.Request.Method) {
		return
	}

	contentType := c.GetHeader("Content-Type")
	switch {
	case strings.Contains(contentType, "application/json"):
		filterJSONBody(c)
	case strings.Contains(contentType, "application/x-www-form-urlencoded"):
		filterFormBody(c)
	}
}

func isWriteMethod(method string) bool {
	return method == "POST" || method == "PUT" || method == "PATCH"
}

func filterJSONBody(c *gin.Context) {
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		return
	}
	escapedBody := escapeXSS(string(bodyBytes))
	c.Request.Body = io.NopCloser(bytes.NewBufferString(escapedBody))
}

func filterFormBody(c *gin.Context) {
	c.Request.ParseForm()
	for key, values := range c.Request.PostForm {
		c.Request.PostForm[key] = escapeStringSlice(values)
	}
}

func escapeStringSlice(values []string) []string {
	for i, value := range values {
		values[i] = escapeXSS(value)
	}
	return values
}

func escapeXSS(s string) string {
	s = html.EscapeString(s)
	s = replaceSpecialChars(s)
	return s
}

func replaceSpecialChars(s string) string {
	replacements := map[string]string{
		"<":  "&lt;",
		">":  "&gt;",
		"\"": "&quot;",
		"'":  "&#x27;",
		"/":  "&#x2F;",
		"`":  "&#x60;",
		"=":  "&#x3D;",
	}
	for old, new := range replacements {
		s = strings.ReplaceAll(s, old, new)
	}
	return s
}

func EscapeString(s string) string {
	return escapeXSS(s)
}