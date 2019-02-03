package main

type AuthorType struct {
	Id         int    `json:"id"`
	First_name string `json:"first_name"`
	Last_name  string `json:"last_name"`
	Email      string `json:"email"`
	Type       string `json:"type"`
}

type TaskType struct {
	Id                 int         `json:"id"`
	Text               string      `json:"text"`
	Create_date        string      `json:"create_date"`
	Last_modified_date string      `json:"last_modified_date"`
	Author             AuthorType  `json:"author"`
	Form_id            int         `json:"form_id"`
	Fields             []interface{} `json:"fields"`
}

type ClinicalRecord struct {
	User_id int      `json:"user_id"`
	Task    TaskType `json:"task"`
}
