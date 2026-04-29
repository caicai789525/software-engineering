package service

import (
	"errors"
	"library-management-system/database"
	"library-management-system/internal/model"
	"library-management-system/internal/repository"
	"log"
	"time"

	"gorm.io/gorm"
)

type BorrowService struct {
	borrowRepo *repository.BorrowRepository
	bookRepo   *repository.BookRepository
	readerRepo *repository.ReaderRepository
	configRepo *repository.ConfigRepository
}

func NewBorrowService() *BorrowService {
	return &BorrowService{
		borrowRepo: repository.NewBorrowRepository(),
		bookRepo:   repository.NewBookRepository(),
		readerRepo: repository.NewReaderRepository(),
		configRepo: repository.NewConfigRepository(),
	}
}

type BorrowRequest struct {
	ReaderID string `json:"reader_id" binding:"required"`
	ISBN     string `json:"isbn" binding:"required"`
}

type ReturnRequest struct {
	ISBN string `json:"isbn" binding:"required"`
}

func (s *BorrowService) BorrowBook(req *BorrowRequest) (*model.BorrowRecord, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic occurred: %v", r)
		}
	}()

	reader, err := s.readerRepo.FindByID(req.ReaderID)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("读者不存在")
		}
		return nil, err
	}

	if reader.Status != model.ReaderStatusNormal {
		tx.Rollback()
		return nil, errors.New("读者状态异常，无法借书")
	}

	book, err := s.bookRepo.FindByISBN(req.ISBN)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("图书不存在")
		}
		return nil, err
	}

	if book.Status != model.BookStatusInLibrary {
		tx.Rollback()
		return nil, errors.New("图书不可借阅")
	}

	activeBorrow, _ := s.borrowRepo.FindActiveByReaderAndISBN(req.ReaderID, req.ISBN)
	if activeBorrow != nil {
		tx.Rollback()
		return nil, errors.New("该图书已被当前读者借阅且未归还")
	}

	maxBorrowCount := s.configRepo.GetInt("max_borrow_count", 5)
	activeCount, err := s.borrowRepo.CountActiveByReader(req.ReaderID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if activeCount >= int64(maxBorrowCount) {
		tx.Rollback()
		return nil, errors.New("已达到最大借阅数量")
	}

	borrowDays := s.configRepo.GetInt("borrow_days", 30)
	now := time.Now()
	dueDate := now.AddDate(0, 0, borrowDays)

	record := &model.BorrowRecord{
		ReaderID:   req.ReaderID,
		ISBN:       req.ISBN,
		BorrowDate: now,
		DueDate:    dueDate,
		Fine:       0,
	}

	if err := tx.Create(record).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(&model.Book{}).Where("isbn = ?", req.ISBN).Update("status", model.BookStatusBorrowed).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return record, nil
}

func (s *BorrowService) ReturnBook(req *ReturnRequest) (*model.BorrowRecord, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic occurred: %v", r)
		}
	}()

	record, err := s.borrowRepo.FindActiveByISBN(req.ISBN)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("未找到该图书的借阅记录")
		}
		return nil, err
	}

	now := time.Now()
	overdueFeePerDay := s.configRepo.GetFloat("overdue_fee_per_day", 0.1)
	var fine float64

	if now.After(record.DueDate) {
		days := int(now.Sub(record.DueDate).Hours() / 24)
		if days > 0 {
			fine = float64(days) * overdueFeePerDay
			if fine > 999.99 {
				fine = 999.99
			}
		}
	}

	record.ReturnDate = &now
	record.Fine = fine

	if err := tx.Save(record).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(&model.Book{}).Where("isbn = ?", req.ISBN).Update("status", model.BookStatusInLibrary).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return record, nil
}

func (s *BorrowService) GetReaderActiveBorrows(readerID string) ([]model.BorrowRecord, error) {
	return s.borrowRepo.ListActiveByReader(readerID)
}

func (s *BorrowService) GetBorrowRank(startDate, endDate string, limit int) ([]struct {
	ISBN   string
	Title  string
	Count  int64
}, error) {
	var start, end time.Time
	if startDate != "" {
		start, _ = time.Parse("2006-01-02", startDate)
	}
	if endDate != "" {
		end, _ = time.Parse("2006-01-02", endDate)
	}
	if limit <= 0 {
		limit = 10
	}
	return s.borrowRepo.GetBorrowRank(start, end, limit)
}

func (s *BorrowService) GetCategoryStats(startDate, endDate string) ([]struct {
	Category string
	Count    int64
}, error) {
	var start, end time.Time
	if startDate != "" {
		start, _ = time.Parse("2006-01-02", startDate)
	}
	if endDate != "" {
		end, _ = time.Parse("2006-01-02", endDate)
	}
	return s.borrowRepo.GetCategoryStats(start, end)
}

func (s *BorrowService) GetOverdueStats(startDate, endDate string) ([]model.BorrowRecord, error) {
	var start, end time.Time
	if startDate != "" {
		start, _ = time.Parse("2006-01-02", startDate)
	}
	if endDate != "" {
		end, _ = time.Parse("2006-01-02", endDate)
	}
	return s.borrowRepo.GetOverdueStats(start, end)
}

func (s *BorrowService) GetMonthlyStats(year int) ([]struct {
	Month int
	Count int64
}, error) {
	return s.borrowRepo.GetMonthlyStats(year)
}
