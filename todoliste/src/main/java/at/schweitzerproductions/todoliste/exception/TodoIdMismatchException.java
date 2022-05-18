package at.schweitzerproductions.todoliste.exception;

public class TodoIdMismatchException extends RuntimeException {

    public TodoIdMismatchException(){
        super();
    }

    public TodoIdMismatchException(String message, Throwable cause) {
        super(message, cause);
    }
    // ...
}

