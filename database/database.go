package database

import (
	"library-management-system/config"
	"library-management-system/internal/model"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB() error {
	var err error
	DB, err = gorm.Open(mysql.Open(config.AppConfig.Database.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return err
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxOpenConns(config.AppConfig.Database.MaxOpenConns)
	sqlDB.SetMaxIdleConns(config.AppConfig.Database.MaxIdleConns)

	log.Println("Database connected successfully")
	return nil
}

// AutoMigrate 自动迁移数据库表
func AutoMigrate() error {
	return DB.AutoMigrate(
		&model.Book{},
		&model.Reader{},
		&model.BorrowRecord{},
		&model.Admin{},
		&model.OperationLog{},
		&model.SystemConfig{},
	)
}
