package controller

import (
	"library-management-system/internal/model"
	"library-management-system/internal/repository"
	"library-management-system/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ConfigController struct {
	configRepo *repository.ConfigRepository
}

func NewConfigController() *ConfigController {
	return &ConfigController{
		configRepo: repository.NewConfigRepository(),
	}
}

func (c *ConfigController) GetAllConfigs(ctx *gin.Context) {
	configs, err := c.configRepo.List()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "获取配置失败")
		return
	}

	result := make(map[string]string)
	for _, config := range configs {
		result[config.ConfigKey] = config.ConfigValue
	}

	response.Success(ctx, result)
}

func (c *ConfigController) UpdateConfig(ctx *gin.Context) {
	key := ctx.Param("key")
	var body struct {
		Value string `json:"value"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		response.Error(ctx, http.StatusBadRequest, "参数错误")
		return
	}

	config, err := c.configRepo.Get(key)
	if err != nil {
		response.Error(ctx, http.StatusNotFound, "配置项不存在")
		return
	}

	config.ConfigValue = body.Value
	err = c.configRepo.Update(config)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "更新配置失败")
		return
	}

	response.Success(ctx, nil)
}

func (c *ConfigController) InitializeConfigs() {
	defaultConfigs := []model.SystemConfig{
		{ConfigKey: "max_borrow_count", ConfigValue: "5", Description: "最大可借数量"},
		{ConfigKey: "borrow_days", ConfigValue: "30", Description: "借阅期限（天）"},
		{ConfigKey: "overdue_fine_per_day", ConfigValue: "0.1", Description: "逾期费用（元/天）"},
	}

	for _, config := range defaultConfigs {
		_, err := c.configRepo.Get(config.ConfigKey)
		if err != nil {
			c.configRepo.Create(&config)
		}
	}
}