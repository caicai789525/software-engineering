package repository

import (
	"library-management-system/database"
	"library-management-system/security/model"
	"strconv"

	"gorm.io/gorm"
)

type ConfigRepository struct {
	db *gorm.DB
}

func NewConfigRepository() *ConfigRepository {
	return &ConfigRepository{db: database.DB}
}

func (r *ConfigRepository) Get(key string) (*model.SystemConfig, error) {
	var config model.SystemConfig
	err := r.db.Where("config_key = ?", key).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func (r *ConfigRepository) GetInt(key string, defaultValue int) int {
	config, err := r.Get(key)
	if err != nil {
		return defaultValue
	}
	value, err := strconv.Atoi(config.ConfigValue)
	if err != nil {
		return defaultValue
	}
	return value
}

func (r *ConfigRepository) GetFloat(key string, defaultValue float64) float64 {
	config, err := r.Get(key)
	if err != nil {
		return defaultValue
	}
	value, err := strconv.ParseFloat(config.ConfigValue, 64)
	if err != nil {
		return defaultValue
	}
	return value
}

func (r *ConfigRepository) List() ([]model.SystemConfig, error) {
	var configs []model.SystemConfig
	err := r.db.Find(&configs).Error
	return configs, err
}

func (r *ConfigRepository) Update(config *model.SystemConfig) error {
	return r.db.Save(config).Error
}
