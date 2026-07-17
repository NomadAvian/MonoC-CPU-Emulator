// route -> + cpu state -> send to Ollama -> return

#include <crow.h>

int main()
{
    crow::SimpleApp app; //define your crow application

    CROW_ROUTE(app, "/")([](){
        return "Hello Marshiat how are you?";
    });

    app.port(6969).multithreaded().run();
}
