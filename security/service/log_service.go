package service

import (
	"library-management-system/security/model"
	"library-management-system/security/repository"
	"time"
)

type LogService struct {
	logRepo *repository.LogRepository
}

func NewLogService() *LogService {
	return &LogService{
		logRepo: repository.NewLogRepository(),
	}
}

func (s *LogService) LogOperation(operator, operationType, targetObject string, params interface{}, ip string) {
	logEntry := &model.OperationLog{
		Operator:     operator,
		OperationType: operationType,
		TargetObject: targetObject,
		IPAddress:    ip,
	}

	if str, ok := params.(string); ok {
		logEntry.RequestParams = str
	} else {
		logEntry.RequestParams = ""
	}

	s.logRepo.Create(logEntry)
}

func (s *LogService) ListLogs(operator, operationType, startTimeStr, endTimeStr string, page, pageSize int) ([]model.OperationLog, int64, error) {
	var startTime, endTime *time.Time

	if startTimeStr != "" {
		if t, err := time.Parse("2006-01-02", startTimeStr); err == nil {
			startTime = &t
		}
	}

	if endTimeStr != "" {
		if t, err := time.Parse("2006-01-02", endTimeStr); err == nil {
			endTime = &t
		}
	}

	return s.logRepo.List(operator, operationType, startTime, endTime, page, pageSize)
}

func (s *LogService) ExportLogs(operator, operationType, startTimeStr, endTimeStr string) ([]model.OperationLog, error) {
	var startTime, endTime *time.Time

	if startTimeStr != "" {
		if t, err := time.Parse("2006-01-02", startTimeStr); err == nil {
			startTime = &t
		}
	}

	if endTimeStr != "" {
		if t, err := time.Parse("2006-01-02", endTimeStr); err == nil {
			endTime = &t
		}
	}

	return s.logRepo.ListAllForExport(operator, operationType, startTime, endTime)
}
