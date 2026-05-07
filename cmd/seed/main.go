package main

import (
	"fmt"
	"log"

	"library-management-system/config"
	"library-management-system/database"
)

func main() {
	if err := config.LoadConfig("D:/PROJECT/go/software-engineering/software-engineering/config/config.yaml"); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}

	db := database.DB

	fmt.Println("添加借阅记录...")

	borrowRecords := []struct {
		readerID   string
		bookID    int
		isbn      string
		borrowDate string
		dueDate    string
		returnDate string
		fine       float64
	}{
		{"202605070001", 4, "9787532789012", "2026-04-07", "2026-04-27", "2026-04-22", 0},
		{"202605070001", 7, "9787115428028", "2026-04-17", "2026-05-07", "", 0},
		{"202605070002", 5, "9787115428028", "2026-04-12", "2026-05-02", "", 0},
		{"202605070003", 8, "9787302553099", "2026-04-27", "2026-05-17", "", 0},
		{"202605070003", 9, "9780141439518", "2026-04-02", "2026-04-22", "2026-04-25", 1.5},
		{"202605070004", 10, "9787513347301", "2026-03-28", "2026-04-17", "2026-04-30", 0},
		{"202605070005", 11, "9780141439518", "2026-04-22", "2026-05-12", "", 0},
	}

	for i, br := range borrowRecords {
		var returnDate interface{}
		if br.returnDate == "" {
			returnDate = nil
		} else {
			returnDate = br.returnDate
		}

		result := db.Exec(`INSERT INTO borrow_records
			(reader_id, book_id, isbn, borrow_date, due_date, return_date, fine)
			VALUES (?, ?, ?, ?, ?, ?, ?)`,
			br.readerID, br.bookID, br.isbn, br.borrowDate, br.dueDate, returnDate, br.fine)

		if result.Error != nil {
			fmt.Printf("添加借阅记录 %d 失败: %v\n", i+1, result.Error)
		} else {
			fmt.Printf("添加借阅记录 %d 成功 (读者: %s, 图书ID: %d)\n", i+1, br.readerID, br.bookID)
		}
	}

	fmt.Println("\n借阅记录添加完成！")
	fmt.Println("请刷新浏览器查看统计报表页面")
}