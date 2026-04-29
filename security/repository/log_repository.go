package repository

import (
	"library-management-system/database"
	"library-management-system/security/model"
	"time"

	"gorm.io/gorm"
)

type LogRepository struct {
	db *gorm.DB
}

func NewLogRepository() *LogRepository {
	return &LogRepository{db: database.DB}
}

func (r *LogRepository) Create(log *model.OperationLog) error {
	return r.db.Create(log).Error
}

func (r *LogRepository) List(operator, operationType string, startTime, endTime *time.Time, page, pageSize int) ([]model.OperationLog, int64, error) {
	var logs []model.OperationLog
	var total int64

	query := r.db.Model(&model.OperationLog{})

	if operator != "" {
		query = query.Where("operator LIKE ?", "%"+operator+"%")
	}
	if operationType != "" {
		query = query.Where("operation_type = ?", operationType)
	}
	if startTime != nil {
		query = query.Where("operation_time >= ?", startTime)
	}
	if endTime != nil {
		query = query.Where("operation_time <= ?", endTime)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = query.Order("operation_time DESC").Offset(offset).Limit(pageSize).Find(&logs).Error
	return logs, total, err
}

func (r *LogRepository) ListAllForExport(operator, operationType string, startTime, endTime *time.Time) ([]model.OperationLog, error) {
	var logs []model.OperationLog

	query := r.db.Model(&model.OperationLog{})

	if operator != "" {
		query = query.Where("operator LIKE ?", "%"+operator+"%")
	}
	if operationType != "" {
		query = query.Where("operation_type = ?", operationType)
	}
	if startTime != nil {
		query = query.Where("operation_time >= ?", startTime)
	}
	if endTime != nil {
		query = query.Where("operation_time <= ?", endTime)
	}

	err := query.Order("operation_time DESC").Find(&logs).Error
	return logs, err
}
