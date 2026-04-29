package service

import (
	"library-management-system/security/model"
	"library-management-system/security/repository"
)

type ConfigService struct {
	configRepo *repository.ConfigRepository
}

func NewConfigService() *ConfigService {
	return &ConfigService{
		configRepo: repository.NewConfigRepository(),
	}
}

type UpdateConfigRequest struct {
	Value string `json:"value" binding:"required"`
}

func (s *ConfigService) GetAllConfigs() (map[string]string, error) {
	configs, err := s.configRepo.List()
	if err != nil {
		return nil, err
	}

	result := make(map[string]string)
	for _, config := range configs {
		result[config.ConfigKey] = config.ConfigValue
	}
	return result, nil
}

func (s *ConfigService) GetAllConfigsWithDetails() ([]model.SystemConfig, error) {
	return s.configRepo.List()
}

func (s *ConfigService) GetConfig(key string) (string, error) {
	config, err := s.configRepo.Get(key)
	if err != nil {
		return "", err
	}
	return config.ConfigValue, nil
}

func (s *ConfigService) UpdateConfig(key, value string) error {
	config, err := s.configRepo.Get(key)
	if err != nil {
		return err
	}
	config.ConfigValue = value
	return s.configRepo.Update(config)
}
