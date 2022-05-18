package at.schweitzerproductions.todoliste;

import at.schweitzerproductions.todoliste.model.TodolistModel;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.List;

import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;
import static org.apache.commons.lang3.RandomStringUtils.randomNumeric;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

//@RunWith(SpringRunner.class)
//@SpringBootTest
public class SpringBootBootstrapLiveTest {

    private static final String API_ROOT
            = "http://localhost:8081/api/todos";

    private TodolistModel createRandomTodolistModel() {
        TodolistModel todo = new TodolistModel();
        todo.setTitle(randomAlphabetic(10));
        todo.setTodo_beschreibung(randomAlphabetic(15));
        return todo;
    }

    private String createTodolistModelAsUri(TodolistModel todo) {
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(todo)
                .post(API_ROOT);
        return API_ROOT + "/" + response.jsonPath().get("id");
    }

    @Test
    public void whenGetAllTodolistModels_thenOK() {
        Response response = RestAssured.get(API_ROOT);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
    }

    @Test
    public void whenGetTodolistModelsByTitle_thenOK() {
        TodolistModel todo = createRandomTodolistModel();
        createTodolistModelAsUri(todo);
        Response response = RestAssured.get(
                API_ROOT + "/title/" + todo.getTitle());

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertTrue(response.as(List.class)
                .size() > 0);
    }
    @Test
    public void whenGetCreatedTodolistModelById_thenOK() {
        TodolistModel todo = createRandomTodolistModel();
        String location = createTodolistModelAsUri(todo);
        Response response = RestAssured.get(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals(todo.getTitle(), response.jsonPath()
                .get("title"));
    }

    @Test
    public void whenGetNotExistTodolistModelById_thenNotFound() {
        Response response = RestAssured.get(API_ROOT + "/" + randomNumeric(4));

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode());
    }

    @Test
    public void whenCreateNewTodolistModel_thenCreated() {
        TodolistModel book = createRandomTodolistModel();
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(book)
                .post(API_ROOT);

        assertEquals(HttpStatus.CREATED.value(), response.getStatusCode());
    }

    @Test
    public void whenInvalidTodolistModel_thenError() {
        TodolistModel book = createRandomTodolistModel();
        book.setTodo_beschreibung(null);
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(book)
                .post(API_ROOT);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode());
    }

    @Test
    public void whenUpdateCreatedTodolistModel_thenUpdated() {
        TodolistModel book = createRandomTodolistModel();
        String location = createTodolistModelAsUri(book);
        book.setId(Long.parseLong(location.split("api/todos/")[1]));
        book.setTodo_beschreibung("Neue Beschreibung");
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(book)
                .put(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());

        response = RestAssured.get(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("Neue Beschreibung", response.jsonPath()
                .get("todo_beschreibung"));
    }

    @Test
    public void whenDeleteCreatedTodolistModel_thenOk() {
        TodolistModel book = createRandomTodolistModel();
        String location = createTodolistModelAsUri(book);
        Response response = RestAssured.delete(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());

        response = RestAssured.get(location);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode());
    }
}
