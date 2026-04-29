package model

import "time"

const (
	RoleReader  = "ROLE_READER"
	RoleLibrarian = "ROLE_LIBRARIAN"
	RoleAdmin   = "ROLE_ADMIN"
)

type Admin struct {
	AdminID     int64     `gorm:"primaryKey;autoIncrement" json:"admin_id"`
	Username    string    `gorm:"uniqueIndex;not null" json:"username"`
	Password    string    `gorm:"not null" json:"-"`
	Role        string    `gorm:"default:ROLE_LIBRARIAN" json:"role"`
	LastLoginIP string    `json:"last_login_ip"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Admin) TableName() string {
	return "admins"
}
