package repository

import (
	"library-management-system/database"
	"library-management-system/internal/model"

	"gorm.io/gorm"
)

type ReaderRepository struct {
	db *gorm.DB
}

func NewReaderRepository() *ReaderRepository {
	return &ReaderRepository{db: database.DB}
}

func (r *ReaderRepository) Create(reader *model.Reader) error {
	return r.db.Create(reader).Error
}

func (r *ReaderRepository) Update(reader *model.Reader) error {
	return r.db.Save(reader).Error
}

func (r *ReaderRepository) Delete(readerID string) error {
	return r.db.Delete(&model.Reader{}, "reader_id = ?", readerID).Error
}

func (r *ReaderRepository) FindByID(readerID string) (*model.Reader, error) {
	var reader model.Reader
	err := r.db.Where("reader_id = ?", readerID).First(&reader).Error
	if err != nil {
		return nil, err
	}
	return &reader, nil
}

func (r *ReaderRepository) List(keyword, status string, page, pageSize int) ([]model.Reader, int64, error) {
	var readers []model.Reader
	var total int64

	query := r.db.Model(&model.Reader{})

	if keyword != "" {
		query = query.Where("reader_id LIKE ? OR name LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Find(&readers).Error
	return readers, total, err
}

func (r *ReaderRepository) UpdateStatus(readerID, status string) error {
	return r.db.Model(&model.Reader{}).Where("reader_id = ?", readerID).Update("status", status).Error
}

func (r *ReaderRepository) HasActiveBorrow(readerID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.BorrowRecord{}).
		Where("reader_id = ? AND return_date IS NULL", readerID).
		Count(&count).Error
	return count > 0, err
}

func (r *ReaderRepository) Exists(readerID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.Reader{}).Where("reader_id = ?", readerID).Count(&count).Error
	return count > 0, err
}
