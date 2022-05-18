package at.schweitzerproductions.todoliste;

import at.schweitzerproductions.todoliste.exception.TodoIdMismatchException;
import at.schweitzerproductions.todoliste.exception.TodolistModelNotFundException;
import at.schweitzerproductions.todoliste.model.TodolistModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodolistRestController {
    @Autowired
    private TodolistModelRepository todoRepo;

    @GetMapping
    public Iterable findAll() {
        return todoRepo.findAll();
    }

    @GetMapping("/title/{todoTitle}")
    public List findByTitle(@PathVariable String todoTitle) {
        return todoRepo.findByTitle(todoTitle);
    }

    @GetMapping("/{id}")
    public TodolistModel findOne(@PathVariable Long id) {
        return todoRepo.findById(id)
                .orElseThrow(TodolistModelNotFundException::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TodolistModel create(@RequestBody TodolistModel todo) {
        return todoRepo.save(todo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        todoRepo.findById(id)
                .orElseThrow(TodolistModelNotFundException::new);
        todoRepo.deleteById(id);
    }

    @PutMapping("/{id}")
    public TodolistModel updateBook(@RequestBody TodolistModel todoList, @PathVariable Long id) {
        if (todoList.getId() != id) {
            throw new TodoIdMismatchException();
        }
        todoRepo.findById(id)
                .orElseThrow(TodolistModelNotFundException::new);
        return todoRepo.save(todoList);
    }
}
