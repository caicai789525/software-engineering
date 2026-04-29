package controller

import (
	"library-management-system/security/service"
	"library-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type ConfigController struct {
	configService *service.ConfigService
}

func NewConfigController() *ConfigController {
	return &ConfigController{
		configService: service.NewConfigService(),
	}
}

func (c *ConfigController) GetAllConfigs(ctx *gin.Context) {
	configs, err := c.configService.GetAllConfigsWithDetails()
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	result := make(map[string]string)
	for _, config := range configs {
		result[config.ConfigKey] = config.ConfigValue
	}

	response.Success(ctx, result)
}

func (c *ConfigController) GetConfig(ctx *gin.Context) {
	key := ctx.Param("key")

	value, err := c.configService.GetConfig(key)
	if err != nil {
		response.Error(ctx, response.CodeError, "配置不存在")
		return
	}

	response.Success(ctx, gin.H{
		"key":   key,
		"value": value,
	})
}

func (c *ConfigController) UpdateConfig(ctx *gin.Context) {
	key := ctx.Param("key")

	var req service.UpdateConfigRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, response.CodeInvalidParam, "参数错误")
		return
	}

	err := c.configService.UpdateConfig(key, req.Value)
	if err != nil {
		response.Error(ctx, response.CodeError, err.Error())
		return
	}

	response.Success(ctx, nil)
}
