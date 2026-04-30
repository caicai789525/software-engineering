
package repository

import (
	"library-management-system/database"
	"library-management-system/internal/model"

	"gorm.io/gorm"
)

type BookRepository struct {
	db *gorm.DB
}

func NewBookRepository() *BookRepository {
	return &BookRepository{db: database.DB}
}

func (r *BookRepository) Create(book *model.Book) error {
	return r.db.Create(book).Error
}

func (r *BookRepository) Update(book *model.Book) error {
	return r.db.Save(book).Error
}

func (r *BookRepository) Delete(bookID int64) error {
	return r.db.Delete(&model.Book{}, bookID).Error
}

func (r *BookRepository) FindByID(bookID int64) (*model.Book, error) {
	var book model.Book
	err := r.db.First(&book, bookID).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (r *BookRepository) FindByISBN(isbn string) (*model.Book, error) {
	var book model.Book
	err := r.db.Where("isbn = ?", isbn).First(&book).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (r *BookRepository) List(keyword, category, status string, page, pageSize int) ([]model.Book, int64, error) {
	var books []model.Book
	var total int64

	query := r.db.Model(&model.Book{})

	if keyword != "" {
		query = query.Where("title LIKE ? OR author LIKE ? OR isbn LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Find(&books).Error
	return books, total, err
}

func (r *BookRepository) UpdateStatus(bookID int64, status string) error {
	return r.db.Model(&model.Book{}).Where("book_id = ?", bookID).Update("status", status).Error
}

func (r *BookRepository) HasActiveBorrow(isbn string, bookID int64) (bool, error) {
	var count int64
	err := r.db.Model(&model.BorrowRecord{}).
		Where("isbn = ? AND book_id = ? AND return_date IS NULL", isbn, bookID).
		Count(&count).Error
	return count > 0, err
}

func (r *BookRepository) Exists(isbn string) (bool, error) {
	var count int64
	err := r.db.Model(&model.Book{}).Where("isbn = ?", isbn).Count(&count).Error
	return count > 0, err
}

func (r *BookRepository) ExistsByID(bookID int64) (bool, error) {
	var count int64
	err := r.db.Model(&model.Book{}).Where("book_id = ?", bookID).Count(&count).Error
	return count > 0, err
}
