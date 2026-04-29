package service

import (
	"errors"
	"fmt"
	"library-management-system/internal/model"
	"library-management-system/internal/repository"
	"regexp"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type ReaderService struct {
	readerRepo *repository.ReaderRepository
}

func NewReaderService() *ReaderService {
	return &ReaderService{
		readerRepo: repository.NewReaderRepository(),
	}
}

type CreateReaderRequest struct {
	Name  string `json:"name" binding:"required"`
	Phone string `json:"phone" binding:"required"`
	Email string `json:"email"`
}

type UpdateReaderRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}

type UpdateReaderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func (s *ReaderService) generateReaderID() string {
	now := time.Now()
	datePart := now.Format("20060102")
	
	var maxSeq int

	readers, _, err := s.readerRepo.List(datePart, "", 1, 100)
	if err == nil {
		for _, r := range readers {
			if len(r.ReaderID) == 12 {
				seq, err := strconv.Atoi(r.ReaderID[8:])
				if err == nil && seq > maxSeq {
					maxSeq = seq
				}
			}
		}
	}

	maxSeq++
	return fmt.Sprintf("%s%04d", datePart, maxSeq)
}

func (s *ReaderService) validatePhone(phone string) bool {
	matched, _ := regexp.MatchString(`^1[3-9]\d{9}$`, phone)
	return matched
}

func (s *ReaderService) validateEmail(email string) bool {
	if email == "" {
		return true
	}
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`, email)
	return matched
}

func (s *ReaderService) CreateReader(req *CreateReaderRequest) (*model.Reader, error) {
	if !s.validatePhone(req.Phone) {
		return nil, errors.New("手机号格式不正确")
	}
	if !s.validateEmail(req.Email) {
		return nil, errors.New("邮箱格式不正确")
	}

	readerID := s.generateReaderID()

	reader := &model.Reader{
		ReaderID: readerID,
		Name:     req.Name,
		Phone:    req.Phone,
		Email:    req.Email,
		RegDate:  time.Now(),
		Status:   model.ReaderStatusNormal,
	}

	err := s.readerRepo.Create(reader)
	if err != nil {
		return nil, err
	}
	return reader, nil
}

func (s *ReaderService) UpdateReader(readerID string, req *UpdateReaderRequest) (*model.Reader, error) {
	reader, err := s.readerRepo.FindByID(readerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("读者不存在")
		}
		return nil, err
	}

	if req.Name != "" {
		reader.Name = req.Name
	}
	if req.Phone != "" {
		if !s.validatePhone(req.Phone) {
			return nil, errors.New("手机号格式不正确")
		}
		reader.Phone = req.Phone
	}
	if req.Email != "" {
		if !s.validateEmail(req.Email) {
			return nil, errors.New("邮箱格式不正确")
		}
		reader.Email = req.Email
	}

	err = s.readerRepo.Update(reader)
	if err != nil {
		return nil, err
	}
	return reader, nil
}

func (s *ReaderService) DeleteReader(readerID string) error {
	hasActive, err := s.readerRepo.HasActiveBorrow(readerID)
	if err != nil {
		return err
	}
	if hasActive {
		return errors.New("该读者有未归还的借阅记录")
	}

	return s.readerRepo.Delete(readerID)
}

func (s *ReaderService) GetReader(readerID string) (*model.Reader, error) {
	return s.readerRepo.FindByID(readerID)
}

func (s *ReaderService) ListReaders(keyword, status string, page, pageSize int) ([]model.Reader, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	return s.readerRepo.List(keyword, status, page, pageSize)
}

func (s *ReaderService) UpdateReaderStatus(readerID string, status string) error {
	exists, err := s.readerRepo.Exists(readerID)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("读者不存在")
	}

	return s.readerRepo.UpdateStatus(readerID, status)
}
