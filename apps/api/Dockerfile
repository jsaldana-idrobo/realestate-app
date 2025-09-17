# apps/api/Dockerfile

# ---------- Build ----------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia sólo el csproj para cachear el restore
COPY Api.csproj ./
# (si tuvieras archivos de NuGet propios, descomenta la siguiente línea)
# COPY NuGet.Config ./

# Limpia caché NuGet y restaura sin paralelismo (más estable en redes con picos)
RUN dotnet nuget locals all --clear
RUN dotnet restore ./Api.csproj --no-cache --disable-parallel

# Ahora copia el resto del código y publica
COPY . .
RUN dotnet publish ./Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---------- Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copia los binarios publicados desde la etapa de build
COPY --from=build /app/publish ./

# Variables típicas (puedes sobreescribirlas con docker-compose)
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
# ENV ASPNETCORE_ENVIRONMENT=Production

# Puerto expuesto por la API
EXPOSE 8080

# Arranque
ENTRYPOINT ["dotnet", "Api.dll"]
