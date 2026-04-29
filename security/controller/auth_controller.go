package controller

import (
	"library-management-system/security/middleware"
	"library-management-system/security/service"
	"library-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService *service.AuthService
}

func NewAuthController() *AuthController {
	return &AuthController{
		authService: service.NewAuthService(),
	}
}

func (c *AuthController) Login(ctx *gin.Context) {
	var req service.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	ip := ctx.ClientIP()
	resp, err := c.authService.Login(&req, ip)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, resp)
}

func (c *AuthController) GetCurrentUser(ctx *gin.Context) {
	username, _ := ctx.Get(middleware.ContextKeyUsername)
	usernameStr, _ := username.(string)

	user, err := c.authService.GetCurrentUser(usernameStr)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, user)
}

func (c *AuthController) ChangePassword(ctx *gin.Context) {
	username, _ := ctx.Get(middleware.ContextKeyUsername)
	usernameStr, _ := username.(string)

	var req service.ChangePasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	err := c.authService.ChangePassword(usernameStr, &req)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, nil)
}
