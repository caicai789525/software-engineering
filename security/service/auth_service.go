package service

import (
	"errors"
	"library-management-system/security/jwt"
	"library-management-system/security/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	adminRepo *repository.AdminRepository
}

func NewAuthService() *AuthService {
	return &AuthService{
		adminRepo: repository.NewAdminRepository(),
	}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
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
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户名或密码错误")
		}
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	token, err := jwt.GenerateToken(admin.Username, admin.Role)
	if err != nil {
		return nil, err
	}

	err = s.adminRepo.UpdateLastLoginIP(admin.AdminID, ip)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		Role:  admin.Role,
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
