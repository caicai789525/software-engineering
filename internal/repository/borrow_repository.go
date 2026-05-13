package repository

import (
	"library-management-system/database"
	"library-management-system/internal/model"
	"time"

	"gorm.io/gorm"
)

type BorrowRepository struct {
	db *gorm.DB
}

func NewBorrowRepository() *BorrowRepository {
	return &BorrowRepository{db: database.DB}
}

func (r *BorrowRepository) Create(record *model.BorrowRecord) error {
	return r.db.Create(record).Error
}

func (r *BorrowRepository) Update(record *model.BorrowRecord) error {
	return r.db.Save(record).Error
}

func (r *BorrowRepository) FindActiveByISBN(isbn string) (*model.BorrowRecord, error) {
	var record model.BorrowRecord
	err := r.db.Where("isbn = ? AND return_date IS NULL", isbn).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *BorrowRepository) FindActiveByBookID(bookID int64) (*model.BorrowRecord, error) {
	var record model.BorrowRecord
	err := r.db.Where("book_id = ? AND return_date IS NULL", bookID).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *BorrowRepository) FindActiveByReaderAndISBN(readerID, isbn string) (*model.BorrowRecord, error) {
	var record model.BorrowRecord
	err := r.db.Where("reader_id = ? AND isbn = ? AND return_date IS NULL", readerID, isbn).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *BorrowRepository) CountActiveByReader(readerID string) (int64, error) {
	var count int64
	err := r.db.Model(&model.BorrowRecord{}).
		Where("reader_id = ? AND return_date IS NULL", readerID).
		Count(&count).Error
	return count, err
}

func (r *BorrowRepository) ListActiveByReader(readerID string) ([]model.BorrowRecord, error) {
	var records []model.BorrowRecord
	err := r.db.Where("reader_id = ? AND return_date IS NULL", readerID).Find(&records).Error
	return records, err
}

func (r *BorrowRepository) ListHistoryByReader(readerID string) ([]model.BorrowRecord, error) {
	var records []model.BorrowRecord
	err := r.db.Where("reader_id = ? AND return_date IS NOT NULL", readerID).
		Order("return_date DESC").
		Find(&records).Error
	return records, err
}

type BorrowRankResult struct {
	ISBN   string `json:"isbn"`
	Title  string `json:"title"`
	Count  int64  `json:"count"`
}

func (r *BorrowRepository) GetBorrowRank(startDate, endDate time.Time, limit int) ([]BorrowRankResult, error) {
	var results []BorrowRankResult

	query := r.db.Table("borrow_records br").
		Select("br.isbn, b.title, COUNT(*) as count").
		Joins("LEFT JOIN books b ON br.isbn = b.isbn")

	if !startDate.IsZero() {
		query = query.Where("br.borrow_date >= ?", startDate)
	}
	if !endDate.IsZero() {
		query = query.Where("br.borrow_date <= ?", endDate)
	}

	err := query.Group("br.isbn, b.title").
		Order("count DESC").
		Limit(limit).
		Scan(&results).Error

	return results, err
}

type CategoryStatsResult struct {
	Category string `json:"category"`
	Count    int64  `json:"count"`
}

func (r *BorrowRepository) GetCategoryStats(startDate, endDate time.Time) ([]CategoryStatsResult, error) {
	var results []CategoryStatsResult

	query := r.db.Table("borrow_records br").
		Select("b.category, COUNT(*) as count").
		Joins("LEFT JOIN books b ON br.isbn = b.isbn")

	if !startDate.IsZero() {
		query = query.Where("br.borrow_date >= ?", startDate)
	}
	if !endDate.IsZero() {
		query = query.Where("br.borrow_date <= ?", endDate)
	}

	err := query.Group("b.category").
		Scan(&results).Error

	return results, err
}

func (r *BorrowRepository) GetOverdueStats(startDate, endDate time.Time) ([]model.BorrowRecord, error) {
	var records []model.BorrowRecord

	query := r.db.Where("fine > 0")

	if !startDate.IsZero() {
		query = query.Where("borrow_date >= ?", startDate)
	}
	if !endDate.IsZero() {
		query = query.Where("borrow_date <= ?", endDate)
	}

	err := query.Find(&records).Error
	return records, err
}

type MonthlyStatsResult struct {
	Month string `json:"month"`
	Count int64  `json:"count"`
}

func (r *BorrowRepository) GetMonthlyStats(year int) ([]MonthlyStatsResult, error) {
	var results []MonthlyStatsResult

	query := r.db.Table("borrow_records").
		Select("DATE_FORMAT(borrow_date, '%Y-%m') as month, COUNT(*) as count")

	if year > 0 {
		query = query.Where("YEAR(borrow_date) = ?", year)
	}

	err := query.Group("month").
		Order("month").
		Scan(&results).Error

	return results, err
}