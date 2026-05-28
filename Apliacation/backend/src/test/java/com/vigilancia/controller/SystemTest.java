package com.vigilancia.controller;

import com.vigilancia.VigilanciaApplication;
import com.vigilancia.dto.LoginRequest;
import com.vigilancia.model.*;
import com.vigilancia.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
    classes = VigilanciaApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SystemTest {

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private TurnoRepository turnoRepo;

    @Autowired
    private ZonaRepository zonaRepo;

    @Autowired
    private CheckpointRepository checkpointRepo;

    @Autowired
    private IncidenteRepository incidenteRepo;

    @Autowired
    private ReasignacionRepository reasignacionRepo;

    private static String docenteToken;
    private static String coordToken;
    private static Long turnoId;
    private static String qrCode;
    private static Long incidenteId;
    private static Long reasignacionId;

    @BeforeEach
    void setupPatchSupport() {
        rest.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    @Test
    @Order(1)
    void step1_LoginAsDocente() {
        var resp = rest.postForEntity(
            "/api/auth/login",
            new LoginRequest("carlos.rodriguez@escuela.edu", "doc123"),
            Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        docenteToken = "Bearer " + ((Map<String, String>) resp.getBody()).get("token");

        var user = (Map<String, Object>) resp.getBody().get("usuario");
        assertThat(user.get("rol")).isEqualTo("DOCENTE");
    }

    @Test
    @Order(2)
    void step2_GetTurns() {
        List<Turno> turnos = turnoRepo.findByUsuarioId(3L);
        assertThat(turnos).isNotEmpty();

        Turno turno = turnos.get(0);
        turnoId = turno.getId();

        Zona zona = turno.getZona();
        qrCode = zona != null ? zona.getCodigoQR() : "QR-PATIO-01";
    }

    @Test
    @Order(3)
    void step3_CheckInViaQR() {
        assertThat(turnoId).isNotNull();
        assertThat(docenteToken).isNotNull();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", docenteToken);

        var body = Map.of(
            "turnoId", turnoId,
            "codigoQR", qrCode != null ? qrCode : "QR-PATIO-01"
        );
        var entity = new HttpEntity<>(body, headers);

        var resp = rest.exchange(
            "/api/checkins/qr", HttpMethod.POST, entity, Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("metodo")).isEqualTo("QR");
    }

    @Test
    @Order(4)
    void step4_RegisterIncident() {
        assertThat(docenteToken).isNotNull();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", docenteToken);

        var body = Map.of(
            "tipo", "CONVIVENCIA",
            "severidad", "S2",
            "descripcion", "Pelea entre estudiantes en el patio - prueba de sistema",
            "zona", Map.of("id", 1),
            "turno", turnoId != null ? Map.of("id", turnoId) : Map.of("id", 1),
            "reportadoPor", Map.of("id", 3)
        );
        var entity = new HttpEntity<>(body, headers);

        var resp = rest.exchange(
            "/api/incidentes", HttpMethod.POST, entity, Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        incidenteId = ((Number) resp.getBody().get("id")).longValue();
    }

    @Test
    @Order(5)
    void step5_LoginAsCoordinator() {
        var resp = rest.postForEntity(
            "/api/auth/login",
            new LoginRequest("ana.garcia@escuela.edu", "coord123"),
            Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        coordToken = "Bearer " + ((Map<String, String>) resp.getBody()).get("token");

        var user = (Map<String, Object>) resp.getBody().get("usuario");
        assertThat(user.get("rol")).isEqualTo("COORDINADOR");
    }

    @Test
    @Order(6)
    void step6_ViewDashboard() {
        assertThat(coordToken).isNotNull();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", coordToken);
        var entity = new HttpEntity<>(headers);

        var resp = rest.exchange(
            "/api/turnos/dashboard", HttpMethod.GET, entity,
            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
    }

    @Test
    @Order(7)
    void step7_CreateReassignment() {
        assertThat(coordToken).isNotNull();
        assertThat(turnoId).isNotNull();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", coordToken);

        var body = Map.of(
            "turnoOriginal", Map.of("id", turnoId),
            "docenteOriginal", Map.of("id", 3),
            "docenteReemplazo", Map.of("id", 4),
            "motivo", "Incapacidad medica - prueba de sistema"
        );
        var entity = new HttpEntity<>(body, headers);

        var resp = rest.exchange(
            "/api/reasignaciones", HttpMethod.POST, entity, Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        reasignacionId = ((Number) resp.getBody().get("id")).longValue();
        assertThat(resp.getBody().get("estado")).isEqualTo("PROPUESTA");
    }

    @Test
    @Order(8)
    void step8_AcceptReassignment() {
        assertThat(coordToken).isNotNull();
        assertThat(reasignacionId).isNotNull();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", coordToken);
        var entity = new HttpEntity<>(headers);

        var resp = rest.exchange(
            "/api/reasignaciones/" + reasignacionId + "/aceptar",
            HttpMethod.PATCH, entity, Map.class
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("estado")).isEqualTo("ACEPTADA");
    }

    @Test
    @Order(9)
    void step9_VerifyFullFlow() {
        assertThat(docenteToken).isNotNull();
        assertThat(coordToken).isNotNull();
        assertThat(turnoId).isNotNull();
        assertThat(incidenteId).isNotNull();
        assertThat(reasignacionId).isNotNull();

        var incidente = incidenteRepo.findById(incidenteId);
        assertThat(incidente).isPresent();
        assertThat(incidente.get().getDescripcion()).contains("prueba de sistema");

        var reasignacion = reasignacionRepo.findById(reasignacionId);
        assertThat(reasignacion).isPresent();
        assertThat(reasignacion.get().getEstado()).isEqualTo(Enums.EstadoReasignacion.ACEPTADA);
    }
}
