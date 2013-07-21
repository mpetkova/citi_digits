from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

# Create your models here.
class School(models.Model):
    name = models.CharField(max_length=255,null=False)
    address = models.CharField(max_length=255,null=False)
    city = models.CharField(max_length=255,null=False)
    state = models.CharField(max_length=2,null=False)


    @classmethod
    def create(cls, name,address,city,state):
        school = cls(name=name,address=address,city=city,state=state)
        return school

class Teacher(models.Model):
    firstName = models.CharField(max_length=255, null=False)
    lastName = models.CharField(max_length=255,null=False)
    email = models.EmailField(max_length=255,null=False)
    # password = models.CharField(max_length=128,null=False)
    school = models.ForeignKey(School,null=False)
    className = models.CharField(max_length=255,null=False)

class Team(models.Model):
    name = models.CharField(max_length=6,null=False)
    teacher = models.ForeignKey(Teacher,null=False)

class Student(models.Model):
    firstName = models.CharField(max_length=255,null=False)
    # password = models.CharField(max_length=128,null=False)
    team = models.ForeignKey(Team)


class CityDigitsUserManager(BaseUserManager):
    """
      Custom user manager
    """
    def create_user(self, role, username,
                    password):
        user = self.model(role=role,username=username,password=password)
        return user

    def create_superuser(self, role, username,
                    password):
        user = self.create_user(role, username,
                                password)
        user.is_admin = True
        user.save()
        return user


class CityDigitsUser(AbstractBaseUser):
    role = models.CharField(max_length=7,null=False)
    username = models.CharField(max_length=255,null=False,unique=True)
    # password = models.CharField(max_length=128,null=False)
    entityId = models.IntegerField(null=False)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "username"

    objects = CityDigitsUserManager()

    def get_full_name(self):
      # The user is identified by their email address
      return self.username

    def __unicode__(self):
      return self.username

    def get_short_name(self):
        return self.username
