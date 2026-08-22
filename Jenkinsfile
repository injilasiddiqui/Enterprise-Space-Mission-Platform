pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Python') {
            steps {
                bat 'python --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    bat 'python -m pip install -r requirements.txt'
                    bat 'python -m pip install pytest requests'
                }
            }
        }

        stage('Automated API Tests') {
            steps {
                bat 'python -m pytest tests/test_api.py -v'
            }
        }
    }

    post {
        success {
            echo 'Enterprise Space Mission CI pipeline completed successfully.'
        }

        failure {
            echo 'CI pipeline failed. Check the Jenkins console output.'
        }
    }
}