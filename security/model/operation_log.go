package model

import "time"

type OperationLog struct {
	LogID        int64     `gorm:"primaryKey;autoIncrement" json:"log_id"`
	Operator     string    `gorm:"not null" json:"operator"`
	OperationType string    `gorm:"not null" json:"operation_type"`
	TargetObject string    `json:"target_object"`
	RequestParams string   `gorm:"type:text" json:"request_params"`
	IPAddress    string    `json:"ip_address"`
	OperationTime time.Time `gorm:"autoCreateTime" json:"operation_time"`
}

func (OperationLog) TableName() string {
	return "operation_logs"
}
