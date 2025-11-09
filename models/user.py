from dataclasses import dataclass
from enum import Enum, auto


class Permissions(Enum):
    READER = auto()
    EDITOR = auto()
    ADMIN = auto()


@dataclass
class User:
    user_name: str
    password: str
    permissions: Permissions = Permissions.READER
