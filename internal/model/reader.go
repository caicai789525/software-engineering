
package model

import "time"

const (
	ReaderStatusNormal   = "正常"
	ReaderStatusInactive = "注销"
)

type Reader struct {
	ReaderID string    `gorm:"column:reader_id;primaryKey" json:"reader_id"`
	Name     string    `gorm:"column:name;not null" json:"name"`
	Phone    string    `gorm:"column:phone;not null" json:"phone"`
	Email    string    `gorm:"column:email" json:"email"`
	RegDate  time.Time `gorm:"column:reg_date;type:date;not null" json:"reg_date"`
	Status   string    `gorm:"column:status;not null;default:'正常'" json:"status"`
}

func (Reader) TableName() string {
	return "readers"
}
