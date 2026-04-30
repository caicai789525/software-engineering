
package model

import "time"

type BorrowRecord struct {
	BorrowID   int64      `gorm:"column:borrow_id;primaryKey;autoIncrement" json:"borrow_id"`
	ReaderID   string     `gorm:"column:reader_id;not null;index" json:"reader_id"`
	BookID     int64      `gorm:"column:book_id;not null;index" json:"book_id"`
	ISBN       string     `gorm:"column:isbn;not null;index" json:"isbn"`
	BorrowDate time.Time  `gorm:"column:borrow_date;type:date;not null" json:"borrow_date"`
	DueDate    time.Time  `gorm:"column:due_date;type:date;not null" json:"due_date"`
	ReturnDate *time.Time `gorm:"column:return_date;type:date" json:"return_date"`
	Fine       float64    `gorm:"column:fine;type:decimal(5,2);not null;default:0" json:"fine"`
}

func (BorrowRecord) TableName() string {
	return "borrow_records"
}
