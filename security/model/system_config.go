package model

import "time"

type SystemConfig struct {
	ConfigKey   string    `gorm:"primaryKey" json:"config_key"`
	ConfigValue string    `gorm:"not null" json:"config_value"`
	Description string    `json:"description"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (SystemConfig) TableName() string {
	return "system_configs"
}
