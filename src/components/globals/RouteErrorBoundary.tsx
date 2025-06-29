import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useNavigate, useRouteError } from "react-router-dom";

interface RouteError {
    status?: number;
    statusText?: string;
    message?: string;
    stack?: string;
}

export function RouteErrorBoundary() {
    const error = useRouteError() as RouteError;
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate("/");
    };

    // Determine error type and message
    let errorMessage = "Ha ocurrido un error inesperado";
    let errorStatus = "";

    if (error?.status) {
        errorStatus = error.status.toString();
        switch (error.status) {
            case 404:
                errorMessage = "La página que buscas no existe";
                break;
            case 403:
                errorMessage = "No tienes permisos para acceder a esta página";
                break;
            case 500:
                errorMessage = "Error interno del servidor";
                break;
            default:
                errorMessage = error.statusText ?? errorMessage;
        }
    } else if (error?.message) {
        errorMessage = error.message;
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                        <AlertCircle className="text-destructive h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">
                        {errorStatus && (
                            <span className="text-muted-foreground mb-1 block text-sm">
                                Error {errorStatus}
                            </span>
                        )}
                        {errorMessage}
                    </CardTitle>
                    <CardDescription>
                        Lo sentimos, algo no salió como esperábamos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button
                            onClick={handleGoBack}
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver atrás
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            className="w-full sm:w-auto"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Ir al inicio
                        </Button>
                    </div>

                    {process.env.NODE_ENV === "development" && error && (
                        <details className="mt-4">
                            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                                Ver detalles del error
                            </summary>
                            <pre className="bg-muted mt-2 overflow-auto rounded p-3 text-xs">
                                {error.stack ?? JSON.stringify(error, null, 2)}
                            </pre>
                        </details>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
