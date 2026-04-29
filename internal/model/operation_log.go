
package model

import "time"

type OperationLog struct {
	LogID          int64     `gorm:"column:log_id;primaryKey;autoIncrement" json:"log_id"`
	Operator       string    `gorm:"column:operator;not null" json:"operator"`
	OperationType  string    `gorm:"column:operation_type;not null" json:"operation_type"`
	TargetObject   string    `gorm:"column:target_object" json:"target_object"`
	RequestParams  string    `gorm:"column:request_params;type:text" json:"request_params"`
	IPAddress      string    `gorm:"column:ip_address" json:"ip_address"`
	OperationTime  time.Time `gorm:"column:operation_time;not null;autoCreateTime" json:"operation_time"`
}

func (OperationLog) TableName() string {
	return "operation_logs"
}
