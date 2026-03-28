import com.jhanvi857.nioflow.NioFlowApp;

import controller.ApiController;
// import com.jhanvi857.nioflow.protocol.HttpStatus;
public class App {
    public static void main (String args[]) {
        NioFlowApp app = new NioFlowApp();
        app.get("/",ctx-> ctx.send("Nioflow is running !"));
        app.get("/timetable", ApiController::getTimetable);
        app.get("/conflicts", ApiController::getConflicts);
        app.get("/analyze-cycle", ApiController::analyzeCycle);
        app.listen(8080);
    }
}