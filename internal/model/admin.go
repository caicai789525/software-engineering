
package model

import "time"

const (
	RoleReader    = "ROLE_READER"
	RoleLibrarian = "ROLE_LIBRARIAN"
	RoleAdmin     = "ROLE_ADMIN"
)

type Admin struct {
	AdminID      int64     `gorm:"column:admin_id;primaryKey;autoIncrement" json:"admin_id"`
	Username     string    `gorm:"column:username;uniqueIndex;not null" json:"username"`
	Password     string    `gorm:"column:password;not null" json:"-"`
	Role         string    `gorm:"column:role;not null;default:'ROLE_LIBRARIAN'" json:"role"`
	LastLoginIP  string    `gorm:"column:last_login_ip" json:"last_login_ip"`
	CreateTime   time.Time `gorm:"column:create_time;not null;autoCreateTime" json:"create_time"`
}

func (Admin) TableName() string {
	return "admins"
}
