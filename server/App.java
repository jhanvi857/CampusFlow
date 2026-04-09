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
        app.get("/notifications", ApiController::getNotifications);
        app.post("/notifications", ApiController::createNotification);
        app.post("/notifications/read", ApiController::markNotificationRead);
        app.post("/notifications/read-all", ApiController::markAllNotificationsRead);
        app.post("/sessions/delete", ApiController::deleteSession);
        app.post("/login", ApiController::login);
        app.get("/complaints", ApiController::getComplaints);
        app.post("/complaints/add", ApiController::addComplaint);
        app.post("/complaints/resolve", ApiController::resolveComplaint);
        app.post("/rooms/available", ApiController::getAvailableRooms);
        app.listen(8080);
    }
}