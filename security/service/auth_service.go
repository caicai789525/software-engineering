package service

import (
	"errors"
	"library-management-system/internal/model"
	"library-management-system/internal/repository"
	"library-management-system/security/jwt"
	securityRepo "library-management-system/security/repository"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	adminRepo  *securityRepo.AdminRepository
	readerRepo *repository.ReaderRepository
}

func NewAuthService() *AuthService {
	return &AuthService{
		adminRepo:  securityRepo.NewAdminRepository(),
		readerRepo: repository.NewReaderRepository(),
	}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token    string `json:"token"`
	Role     string `json:"role"`
	Username string `json:"username"`
}

type CurrentUserResponse struct {
	Username string `json:"username"`
	Role     string `json:"role"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func (s *AuthService) Login(req *LoginRequest, ip string) (*LoginResponse, error) {
	admin, err := s.adminRepo.FindByUsername(req.Username)
	if err == nil {
		err = bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password))
		if err != nil {
			return nil, errors.New("用户名或密码错误")
		}

		token, err := jwt.GenerateToken(admin.Username, admin.Role)
		if err != nil {
			return nil, err
		}

		_ = s.adminRepo.UpdateLastLoginIP(admin.AdminID, ip)

		return &LoginResponse{
			Token:    token,
			Role:     admin.Role,
			Username: admin.Username,
		}, nil
	}

	var reader *model.Reader

	reader, err = s.readerRepo.FindByID(req.Username)
	if err != nil {
		reader, err = s.readerRepo.FindByName(req.Username)
		if err != nil {
			return nil, errors.New("用户名或密码错误")
		}
	}

	if reader.Status != model.ReaderStatusNormal {
		return nil, errors.New("账号已被注销")
	}

	err = bcrypt.CompareHashAndPassword([]byte(reader.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	token, err := jwt.GenerateToken(reader.ReaderID, "ROLE_READER")
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token:    token,
		Role:     "ROLE_READER",
		Username: reader.ReaderID,
	}, nil
}

func (s *AuthService) GetCurrentUser(username string) (*CurrentUserResponse, error) {
	admin, err := s.adminRepo.FindByUsername(username)
	if err != nil {
		return nil, err
	}
	return &CurrentUserResponse{
		Username: admin.Username,
		Role:     admin.Role,
	}, nil
}

func (s *AuthService) ChangePassword(username string, req *ChangePasswordRequest) error {
	admin, err := s.adminRepo.FindByUsername(username)
	if err != nil {
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.OldPassword))
	if err != nil {
		return errors.New("原密码错误")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.adminRepo.UpdatePassword(admin.AdminID, string(hashedPassword))
}

func HashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}
