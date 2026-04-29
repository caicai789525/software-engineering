
package model

import "time"

type SystemConfig struct {
	ConfigKey   string    `gorm:"column:config_key;primaryKey" json:"config_key"`
	ConfigValue string    `gorm:"column:config_value;not null" json:"config_value"`
	Description string    `gorm:"column:description" json:"description"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null;autoUpdateTime" json:"updated_at"`
}

func (SystemConfig) TableName() string {
	return "system_configs"
}
