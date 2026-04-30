package service

import (
	"errors"
	"library-management-system/internal/model"
	"library-management-system/internal/repository"
	"time"

	"gorm.io/gorm"
)

type BookService struct {
	bookRepo   *repository.BookRepository
}

func NewBookService() *BookService {
	return &BookService{
		bookRepo: repository.NewBookRepository(),
	}
}

type CreateBookRequest struct {
	ISBN      string    `json:"isbn" binding:"required"`
	Title     string    `json:"title" binding:"required"`
	Author    string    `json:"author" binding:"required"`
	Publisher string    `json:"publisher"`
	Category  string    `json:"category"`
	Location  string    `json:"location"`
	EntryDate time.Time `json:"entry_date"`
}

type UpdateBookRequest struct {
	Title     string    `json:"title"`
	Author    string    `json:"author"`
	Publisher string    `json:"publisher"`
	Category  string    `json:"category"`
	Location  string    `json:"location"`
	Status    string    `json:"status"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func (s *BookService) CreateBook(req *CreateBookRequest) (*model.Book, error) {
	book := &model.Book{
		ISBN:       req.ISBN,
		Title:      req.Title,
		Author:     req.Author,
		Publisher:  req.Publisher,
		Category:   req.Category,
		Location:   req.Location,
		Status:     model.BookStatusInLibrary,
		EntryDate:  req.EntryDate,
	}

	if book.EntryDate.IsZero() {
		book.EntryDate = time.Now()
	}

	err := s.bookRepo.Create(book)
	if err != nil {
		return nil, err
	}
	return book, nil
}

func (s *BookService) UpdateBook(bookID int64, req *UpdateBookRequest) (*model.Book, error) {
	book, err := s.bookRepo.FindByID(bookID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("图书不存在")
		}
		return nil, err
	}

	if req.Title != "" {
		book.Title = req.Title
	}
	if req.Author != "" {
		book.Author = req.Author
	}
	if req.Publisher != "" {
		book.Publisher = req.Publisher
	}
	if req.Category != "" {
		book.Category = req.Category
	}
	if req.Location != "" {
		book.Location = req.Location
	}
	if req.Status != "" {
		book.Status = req.Status
	}

	err = s.bookRepo.Update(book)
	if err != nil {
		return nil, err
	}
	return book, nil
}

func (s *BookService) DeleteBook(bookID int64) error {
	book, err := s.bookRepo.FindByID(bookID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("图书不存在")
		}
		return err
	}

	hasActive, err := s.bookRepo.HasActiveBorrow(book.ISBN, bookID)
	if err != nil {
		return err
	}
	if hasActive {
		return errors.New("该图书有未归还的借阅记录")
	}

	return s.bookRepo.Delete(bookID)
}

func (s *BookService) GetBook(bookID int64) (*model.Book, error) {
	return s.bookRepo.FindByID(bookID)
}

func (s *BookService) ListBooks(keyword, category, status string, page, pageSize int) ([]model.Book, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	return s.bookRepo.List(keyword, category, status, page, pageSize)
}

func (s *BookService) UpdateBookStatus(bookID int64, status string) error {
	exists, err := s.bookRepo.ExistsByID(bookID)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("图书不存在")
	}

	return s.bookRepo.UpdateStatus(bookID, status)
}
