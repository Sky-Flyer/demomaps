package at.schweitzerproductions.todoliste.model;

//import javax.persistence.*;

import javax.persistence.*;

@Entity
public class TodolistModel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(nullable = false)
    private String todo_beschreibung;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTodo_beschreibung() {
        return todo_beschreibung;
    }

    public void setTodo_beschreibung(String todo_beschreibung) {
        this.todo_beschreibung = todo_beschreibung;
    }
}
