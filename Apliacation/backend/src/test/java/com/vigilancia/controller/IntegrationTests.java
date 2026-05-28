package com.vigilancia.controller;

import com.vigilancia.VigilanciaApplication;
import com.vigilancia.dto.LoginRequest;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Incidente;
import com.vigilancia.model.Turno;
import com.vigilancia.model.Usuario;
import com.vigilancia.repository.IncidenteRepository;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.UsuarioRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
    classes = VigilanciaApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class IntegrationTests {

    @Autowired
    private TestRestTemplate rest;

    @BeforeEach
    void setupPatchSupport() {
        rest.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private TurnoRepository turnoRepo;

    @Autowired
    private IncidenteRepository incidenteRepo;

    private static String adminToken;
    private static String docenteToken;
    private static Long turnoId;

    @BeforeEach
    void setUp() {
        if (adminToken == null) {
            var loginResp = rest.postForEntity(
                "/api/auth/login",
                new LoginRequest("admin@colegio.edu", "admin123"),
                Map.class
            );
            adminToken = "Bearer " + ((Map<String, String>) loginResp.getBody()).get("token");

            var docLoginResp = rest.postForEntity(
                "/api/auth/login",
                new LoginRequest("carlos.rodriguez@escuela.edu", "doc123"),
                Map.class
            );
            docenteToken = "Bearer " + ((Map<String, String>) docLoginResp.getBody()).get("token");

            List<Turno> turnos = turnoRepo.findAll();
            if (!turnos.isEmpty()) {
                turnoId = turnos.get(0).getId();
            }
        }
    }

    @Test
    @Order(1)
    void testLogin_ReturnsToken() {
        var loginResp = rest.postForEntity(
            "/api/auth/login",
            new LoginRequest("admin@colegio.edu", "admin123"),
            Map.class
        );
        assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResp.getBody()).containsKey("token");
        assertThat(loginResp.getBody()).containsKey("usuario");
    }

    @Test
    @Order(2)
    void testGet_Incidentes() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", docenteToken);
        var entity = new HttpEntity<>(headers);

        var resp = rest.exchange("/api/incidentes", HttpMethod.GET, entity, List.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
    }

    @Test
    @Order(3)
    void testPost_Incidente() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", docenteToken);

        var body = Map.of(
            "tipo", "FISICO",
            "severidad", "S1",
            "descripcion", "Incidente de prueba - integracion",
            "zona", Map.of("id", 1),
            "turno", Map.of("id", turnoId != null ? turnoId : 1),
            "reportadoPor", Map.of("id", 3)
        );
        var entity = new HttpEntity<>(body, headers);

        var resp = rest.exchange("/api/incidentes", HttpMethod.POST, entity, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).containsKey("id");
    }

    @Test
    @Order(4)
    void testPut_Incidente() {
        var incidente = incidenteRepo.findAll().stream()
            .filter(i -> "Incidente de prueba - integracion".equals(i.getDescripcion()))
            .findFirst().orElse(null);
        if (incidente == null) return;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", docenteToken);

        var body = Map.of("descripcion", "Descripcion actualizada - PUT");
        var entity = new HttpEntity<>(body, headers);

        var resp = rest.exchange(
            "/api/incidentes/" + incidente.getId(),
            HttpMethod.PUT, entity, Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("descripcion")).isEqualTo("Descripcion actualizada - PUT");
    }

    @Test
    @Order(5)
    void testPatch_Incidente_Resolver() {
        var incidente = incidenteRepo.findAll().stream()
            .filter(i -> "Descripcion actualizada - PUT".equals(i.getDescripcion()))
            .findFirst().orElse(null);
        if (incidente == null) return;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", docenteToken);
        var entity = new HttpEntity<>(headers);

        var resp = rest.exchange(
            "/api/incidentes/" + incidente.getId() + "/resolver",
            HttpMethod.PATCH, entity, Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("estado")).isEqualTo("RESUELTO");
    }

    @Test
    @Order(6)
    void testDelete_Incidente() {
        var incidente = incidenteRepo.findAll().stream()
            .filter(i -> "Incidente de prueba - integracion".equals(i.getDescripcion()))
            .findFirst().orElse(null);
        if (incidente == null) return;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", adminToken);
        var entity = new HttpEntity<>(headers);

        var resp = rest.exchange(
            "/api/incidentes/" + incidente.getId(),
            HttpMethod.DELETE, entity, Void.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }
}
