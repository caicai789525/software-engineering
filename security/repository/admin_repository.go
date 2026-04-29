package repository

import (
	"library-management-system/database"
	"library-management-system/security/model"

	"gorm.io/gorm"
)

type AdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository() *AdminRepository {
	return &AdminRepository{db: database.DB}
}

func (r *AdminRepository) FindByUsername(username string) (*model.Admin, error) {
	var admin model.Admin
	err := r.db.Where("username = ?", username).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *AdminRepository) UpdateLastLoginIP(adminID int64, ip string) error {
	return r.db.Model(&model.Admin{}).Where("admin_id = ?", adminID).Update("last_login_ip", ip).Error
}

func (r *AdminRepository) UpdatePassword(adminID int64, hashedPassword string) error {
	return r.db.Model(&model.Admin{}).Where("admin_id = ?", adminID).Update("password", hashedPassword).Error
}

func (r *AdminRepository) Create(admin *model.Admin) error {
	return r.db.Create(admin).Error
}

func (r *AdminRepository) List(page, pageSize int) ([]model.Admin, int64, error) {
	var admins []model.Admin
	var total int64

	offset := (page - 1) * pageSize

	err := r.db.Model(&model.Admin{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Offset(offset).Limit(pageSize).Find(&admins).Error
	return admins, total, err
}

func (r *AdminRepository) Delete(adminID int64) error {
	return r.db.Delete(&model.Admin{}, adminID).Error
}
