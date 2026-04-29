package middleware

import (
	"library-management-system/security/jwt"
	"library-management-system/security/model"
	"library-management-system/pkg/response"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	ContextKeyUsername = "username"
	ContextKeyRole     = "role"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, http.StatusUnauthorized, "未提供认证token")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.Error(c, http.StatusUnauthorized, "认证格式错误")
			c.Abort()
			return
		}

		claims, err := jwt.ParseToken(parts[1])
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "token无效或已过期")
			c.Abort()
			return
		}

		c.Set(ContextKeyUsername, claims.Username)
		c.Set(ContextKeyRole, claims.Role)
		c.Next()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get(ContextKeyRole)
		if !exists {
			response.Error(c, http.StatusUnauthorized, "未认证")
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			response.Error(c, http.StatusUnauthorized, "角色信息错误")
			c.Abort()
			return
		}

		hasRole := false
		for _, r := range roles {
			if roleStr == r {
				hasRole = true
				break
			}
		}

		if !hasRole {
			response.Error(c, http.StatusForbidden, "权限不足")
			c.Abort()
			return
		}

		c.Next()
	}
}

func RequireAdmin() gin.HandlerFunc {
	return RequireRole(model.RoleAdmin)
}

func RequireLibrarianOrAdmin() gin.HandlerFunc {
	return RequireRole(model.RoleLibrarian, model.RoleAdmin)
}
