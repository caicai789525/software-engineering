
package model

import "time"

const (
	BookStatusInLibrary = "在馆"
	BookStatusBorrowed  = "借出"
	BookStatusRepair    = "修复"
	BookStatusLost      = "遗失"
)

type Book struct {
	BookID     int64     `gorm:"column:book_id;primaryKey;autoIncrement" json:"book_id"`
	ISBN       string    `gorm:"column:isbn;not null" json:"isbn"`
	Title      string    `gorm:"column:title;not null" json:"title"`
	Author     string    `gorm:"column:author;not null" json:"author"`
	Publisher  string    `gorm:"column:publisher" json:"publisher"`
	Category   string    `gorm:"column:category" json:"category"`
	Location   string    `gorm:"column:location" json:"location"`
	Status     string    `gorm:"column:status;not null;default:'在馆'" json:"status"`
	EntryDate  time.Time `gorm:"column:entry_date;type:date;not null" json:"entry_date"`
}

func (Book) TableName() string {
	return "books"
}
