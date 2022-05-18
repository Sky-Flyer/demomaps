package at.schweitzerproductions.todoliste.exception;

public class TodolistModelNotFundException extends RuntimeException {

    public TodolistModelNotFundException(){
        super();
    }
    TodolistModelNotFundException (String message, Throwable cause) {
        super(message, cause);
    }
}
