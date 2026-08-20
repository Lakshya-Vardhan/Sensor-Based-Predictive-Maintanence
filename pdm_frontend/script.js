// =====================================================
// MACHINE DATA
// =====================================================

const machines = {

    "CNC": {
        name: "CNC Machine",
        shortName: "CNC",
        id: "CNC-001",
        description:
            "Computer controlled machining system."
    },

    "Pump": {
        name: "Pump",
        shortName: "PMP",
        id: "PMP-001",
        description:
            "Industrial fluid movement system."
    },

    "Compressor": {
        name: "Compressor",
        shortName: "CMP",
        id: "CMP-001",
        description:
            "Industrial air and gas compression system."
    },

    "Robotic Arm": {
        name: "Robotic Arm",
        shortName: "ROB",
        id: "ROB-001",
        description:
            "Automated robotic manipulation system."
    }
};


// =====================================================
// GET ELEMENTS
// =====================================================

const machineOptions =
    document.querySelectorAll(".machine-option");

const selectedMachineName =
    document.getElementById("selectedMachineName");

const machineId =
    document.getElementById("machineId");

const machinePreviewIcon =
    document.querySelector(".machine-preview-icon");

const machineTypeDisplay =
    document.getElementById("machineTypeDisplay");

const form =
    document.getElementById("predictionForm");

const results =
    document.getElementById("results");

const failure24Prediction =
    document.getElementById("failure24Prediction");

const failure24Description =
    document.getElementById("failure24Description");

const failureTypePrediction =
    document.getElementById("failureTypePrediction");

const failureTypeDescription =
    document.getElementById("failureTypeDescription");

const machineStatus =
    document.getElementById("machineStatus");

const recommendation =
    document.getElementById("recommendation");


// =====================================================
// CURRENT MACHINE
// =====================================================

let selectedMachine = "CNC";


// =====================================================
// MACHINE SELECTION
// =====================================================

machineOptions.forEach(option => {

    option.addEventListener("click", () => {

        // Get selected machine
        selectedMachine =
            option.dataset.machine;

        // Remove selected from all
        machineOptions.forEach(item => {
            item.classList.remove("selected");
        });

        // Select current machine
        option.classList.add("selected");

        // Update machine UI
        updateMachine(selectedMachine);

        // Update step indicator
        updateStep(1);
    });
});


// =====================================================
// UPDATE MACHINE
// =====================================================

function updateMachine(machineType) {

    const machine = machines[machineType];

    if (!machine) {
        return;
    }

    // Machine name
    selectedMachineName.textContent =
        machine.name;

    // Machine ID
    machineId.textContent =
        machine.id;

    // Icon
    machinePreviewIcon.textContent =
        machine.shortName;

    // Machine description
    machineTypeDisplay.textContent =
        machine.description;

    // Update page heading
    document.title =
        `${machine.name} | Predictive Maintenance`;

    // Small visual animation
    selectedMachineName.classList.remove(
        "machine-change"
    );

    void selectedMachineName.offsetWidth;

    selectedMachineName.classList.add(
        "machine-change"
    );
}


// =====================================================
// STEP INDICATOR
// =====================================================

function updateStep(stepNumber) {

    const steps =
        document.querySelectorAll(".step");

    steps.forEach((step, index) => {

        if (index <= stepNumber - 1) {

            step.classList.add("active");

        }
    });
}


// =====================================================
// FORM SUBMISSION
// =====================================================

form.addEventListener("submit", async event => {

    event.preventDefault();


    // ---------------------------------------------
    // Read values
    // ---------------------------------------------

    const data = {

        machine_type:
            selectedMachine,

        vibration_rms:
            Number(
                document.getElementById(
                    "vibration"
                ).value
            ),

        temperature_motor:
            Number(
                document.getElementById(
                    "temperature"
                ).value
            ),

        current_phase_avg:
            Number(
                document.getElementById(
                    "current"
                ).value
            ),

        hours_since_maintenance:
            Number(
                document.getElementById(
                    "maintenance"
                ).value
            ),

        pressure_level:
            Number(
                document.getElementById(
                    "pressure"
                ).value
            ),

        rpm:
            Number(
                document.getElementById(
                    "rpm"
                ).value
            )
    };


    // ---------------------------------------------
    // Validate
    // ---------------------------------------------

    if (
        data.vibration_rms < 0 ||
        data.temperature_motor < 0 ||
        data.current_phase_avg < 0 ||
        data.hours_since_maintenance < 0 ||
        data.pressure_level < 0 ||
        data.rpm < 0
    ) {

        alert(
            "Please enter valid positive sensor values."
        );

        return;
    }


    // ---------------------------------------------
    // Get button
    // ---------------------------------------------

    const button =
        document.querySelector(
            ".analyze-button"
        );


    // ---------------------------------------------
    // Loading state
    // ---------------------------------------------

    button.disabled = true;

    button.querySelector(
        "span:first-child"
    ).textContent =
        "Analyzing...";

    updateStep(2);


    try {

        // -----------------------------------------
        // Send request to FastAPI
        // -----------------------------------------

        const response =
            await fetch(
                "http://127.0.0.1:8000/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        // -----------------------------------------
        // Check response
        // -----------------------------------------

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        // -----------------------------------------
        // Convert response to JSON
        // -----------------------------------------

        const prediction =
            await response.json();


        console.log(
            "Prediction:",
            prediction
        );


        // -----------------------------------------
        // Display prediction
        // -----------------------------------------

        displayPrediction(prediction);


        // -----------------------------------------
        // Update step
        // -----------------------------------------

        updateStep(3);


        // -----------------------------------------
        // Scroll to results
        // -----------------------------------------

        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        alert(
            "Unable to connect to the prediction server.\n\n" +
            "Make sure FastAPI is running on port 8000."
        );

    } finally {

        // -----------------------------------------
        // Restore button
        // -----------------------------------------

        button.disabled = false;

        button.querySelector(
            "span:first-child"
        ).textContent =
            "Analyze Machine";
    }

});


// =====================================================
// DISPLAY PREDICTION
// =====================================================

function displayPrediction(prediction) {

    // Show results
    results.classList.remove("hidden");


    // =================================================
    // FAILURE WITHIN 24 HOURS
    // =================================================

    if (prediction.failure_within_24h) {

        failure24Prediction.textContent =
            "YES";

        failure24Prediction.className =
            "prediction-value danger";

        failure24Description.textContent =
            "The model predicts that this machine may experience a failure within the next 24 hours.";


        // =================================================
        // FAILURE TYPE
        // =================================================

        const formattedFailure =
            formatFailureType(
                prediction.failure_type
            );

        failureTypePrediction.textContent =
            formattedFailure;

        failureTypePrediction.className =
            "prediction-value danger";

        failureTypeDescription.textContent =
            "The predicted failure type requires attention and further inspection.";


        // =================================================
        // STATUS
        // =================================================

        machineStatus.textContent =
            "● HIGH RISK";

        machineStatus.className =
            "status danger";


        // =================================================
        // RECOMMENDATION
        // =================================================

        recommendation.className =
            "recommendation danger";

        recommendation.querySelector(
            ".recommendation-icon"
        ).textContent =
            "!";

        recommendation.querySelector(
            "strong"
        ).textContent =
            "Machine requires attention";

        recommendation.querySelector(
            "p"
        ).textContent =
            `Potential ${formattedFailure.toLowerCase()} failure detected. Inspect the machine and consider preventive maintenance.`;

    }


    // =================================================
    // NORMAL
    // =================================================

    else {

        failure24Prediction.textContent =
            "NO";

        failure24Prediction.className =
            "prediction-value safe";

        failure24Description.textContent =
            "The model does not predict a failure within the next 24 hours.";


        failureTypePrediction.textContent =
            "NONE";

        failureTypePrediction.className =
            "prediction-value safe";

        failureTypeDescription.textContent =
            "No specific failure type has been detected.";


        // =================================================
        // STATUS
        // =================================================

        machineStatus.textContent =
            "● NORMAL";

        machineStatus.className =
            "status normal";


        // =================================================
        // RECOMMENDATION
        // =================================================

        recommendation.className =
            "recommendation normal";

        recommendation.querySelector(
            ".recommendation-icon"
        ).textContent =
            "✓";

        recommendation.querySelector(
            "strong"
        ).textContent =
            "Machine operating normally";

        recommendation.querySelector(
            "p"
        ).textContent =
            "Continue normal monitoring and follow the regular maintenance schedule.";
    }
}


// =====================================================
// FORMAT FAILURE TYPE
// =====================================================

function formatFailureType(type) {

    if (!type) {
        return "Unknown";
    }

    if (
        type.toLowerCase() === "none"
    ) {
        return "No Specific Failure";
    }

    return type
        .split("_")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
}


// =====================================================
// INITIALIZE
// =====================================================

updateMachine("CNC");

updateStep(1);